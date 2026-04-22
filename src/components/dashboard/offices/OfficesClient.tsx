'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import FormField from '@/components/FormField';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Card from '@/components/Card';
import { EmptyOffices } from '@/components/EmptyState';
import { ImagePreview } from '@/components/ImagePreview';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import Plus from 'lucide-react/dist/esm/icons/plus';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Coins from 'lucide-react/dist/esm/icons/coins';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Navigation from 'lucide-react/dist/esm/icons/navigation';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import dynamic from 'next/dynamic';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppStore } from '@/lib/appStore';
import { VALID_REGEX } from '@/constants/regex';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { useRouter } from '@/navigation';
import { useAuthStore } from '@/lib/store';

const Modal = dynamic(() => import('@/components/Modal'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted/20 rounded-lg animate-pulse" />,
});

interface Office {
  _id: string;
  name: string;
  address: string;
  cityName: string;
  cca: number;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  photo?: string;
  updatedAt?: string;
}

export function OfficesClient() {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cityName: '',
    cca: '',
    latitude: '',
    longitude: '',
    radius: '100',
    photo: null as File | null,
  });

  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.OFFICES_MANAGE);
  const router = useRouter();
  const { user } = useAuthStore();

  // Data
  const { offices, fetchOffices: storeFetchOffices, lastFetched, removeOffice, isFetching } = useAppStore();
  const {
    errors,
    success,
    handleError,
    handleSuccess,
    clearErrors,
    setErrors,
    setSuccess,
  } = useErrorHandler(t);

  // Fetch offices
  const fetchOfficesData = async (force = false) => {
    try {
      if (!force && lastFetched.offices && offices.length > 0) {
        return; // Cache bouncer
      }
      await storeFetchOffices(force);
    } catch (err) {
      handleError(err, t('offices.errors.networkError'));
    }
  };

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/dashboard');
    } else if (user) {
      fetchOfficesData();
    }
  }, [user, isAdmin, router, offices.length, lastFetched.offices]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearErrors();

    // Validation
    const name = formData.name.trim();
    const cityName = formData.cityName.trim();
    const address = formData.address.trim();

    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = t('offices.errors.nameRequired');
    } else if (!VALID_REGEX.OFFICE_NAME.test(name)) {
      newErrors.name = t('offices.errors.nameFormatInvalid');
    }

    if (!cityName) {
      newErrors.cityName = t('offices.errors.cityNameRequired');
    } else if (!VALID_REGEX.CITY_NAME.test(cityName)) {
      newErrors.cityName = t('offices.errors.cityNameFormatInvalid');
    }

    if (!address) {
      newErrors.address = t('offices.errors.addressRequired');
    }

    if (!formData.latitude) {
      newErrors.latitude = t('offices.errors.locationRequired');
    } else if (!VALID_REGEX.LATITUDE.test(formData.latitude)) {
      newErrors.latitude = t('offices.errors.latitudeInvalid');
    }

    if (!formData.longitude) {
      newErrors.longitude = t('offices.errors.locationRequired');
    } else if (!VALID_REGEX.LONGITUDE.test(formData.longitude)) {
      newErrors.longitude = t('offices.errors.longitudeInvalid');
    }

    if (!formData.radius) {
      newErrors.radius = t('offices.errors.radiusRequired');
    } else {
      const radiusVal = parseFloat(formData.radius);
      if (isNaN(radiusVal) || radiusVal <= 0) {
        newErrors.radius = t('offices.errors.radiusInvalid');
      } else if (radiusVal > 5000) {
        newErrors.radius = t('offices.errors.radiusLimit');
      }
    }

    if (formData.cca) {
      const ccaVal = parseFloat(formData.cca);
      if (isNaN(ccaVal) || ccaVal < 0) {
        newErrors.cca = t('offices.errors.ccaInvalid');
      } else if (ccaVal > 100000) {
        newErrors.cca = t('offices.errors.ccaLimit');
      }
    }

    if (formData.photo) {
      if (!formData.photo.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        newErrors.photo = t('offices.errors.invalidFileType');
      }
      if (formData.photo.size > 2 * 1024 * 1024) {
        newErrors.photo = t('offices.errors.fileTooLarge');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        const element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', name);
      submitData.append('address', address);
      submitData.append('cityName', cityName);
      submitData.append('cca', formData.cca || '0');
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      submitData.append('radius', formData.radius);
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      const response = editingOffice
        ? await api.offices.update(editingOffice._id, submitData)
        : await api.offices.create(submitData);

      if (response.ok) {
        handleSuccess(editingOffice ? t('offices.success.officeUpdated') : t('offices.success.officeCreated'));
        setShowModal(false);
        resetForm();
        fetchOfficesData(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleError(errorData, t('offices.errors.failedToSave'));
      }
    } catch (err) {
      handleError(err, t('offices.errors.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      cityName: '',
      cca: '',
      latitude: '',
      longitude: '',
      radius: '100',
      photo: null,
    });
    setEditingOffice(null);
    setErrors({});
  };

  const handleEdit = (office: Office) => {
    setEditingOffice(office);
    setFormData({
      name: office.name,
      address: office.address,
      cityName: office.cityName,
      cca: office.cca.toString(),
      latitude: office.location.latitude.toString(),
      longitude: office.location.longitude.toString(),
      radius: office.radius.toString(),
      photo: null,
    });
    setShowModal(true);
    clearErrors();
  };

  const handleDelete = async (office: Office) => {
    try {
      const response = await api.offices.delete(office._id);
      if (response.ok) {
        removeOffice(office._id);
        handleSuccess(t('offices.success.officeDeactivated'));
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleError(errorData, t('offices.errors.failedToSave'));
      }
    } catch (err) {
      handleError(err, 'Network error');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      handleError({ message: t('offices.errors.geolocationNotSupported') });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setLocationLoading(false);
      },
      (error) => {
        handleError({ message: t('offices.errors.unableToRetrieveLocation') });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    clearErrors();
    setFormData(prev => ({ ...prev, photo: file }));
  };

  // If user is logged in but not an admin, show nothing while redirecting
  if (user && !isAdmin) {
    return null;
  }

  return (
    <>
      {/* Central Feedback */}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}
      {errors.general && (
        <Alert type="error" message={errors.general} onClose={() => setErrors({ ...errors, general: '' })} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('offices.title')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('offices.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex-row items-center justify-center gap-2 px-3 sm:px-4 w-full md:w-auto"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="text-sm whitespace-nowrap leading-none">{t('offices.addOffice')}</span>
        </Button>
      </div>

      {/* Offices Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-6 lg:gap-8">
        {offices.map((office: any) => (
          <Card
            key={office._id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border overflow-hidden"
            onClick={() => handleEdit(office)}
            hover
          >
            <div className="space-y-4">
              {/* Office Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {office.photo ? (
                  <ImagePreview
                    src={office.photo?.startsWith('http') ? office.photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${office.photo}${office.updatedAt ? `?v=${new Date(office.updatedAt).getTime()}` : ''}`}
                    alt={office.name}
                    className="h-full w-full"
                    thumbnailClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded-md shadow-sm backdrop-blur-sm">
                  {t('offices.card.office')}
                </div>
              </div>

              {/* Office Info */}
              <div className="px-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {office.name}
                </h2>
                <p className="text-muted-foreground text-sm mb-1 line-clamp-2">
                  {office.address}
                </p>
                <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{office.cityName}</span>
                </div>
                {office.cca > 0 && (
                  <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4 shrink-0" />
                    <span>CCA: ₹{office.cca}</span>
                  </div>
                  // <p className="mt-1 text-sm font-medium text-secondary dark:text-secondary">
                  //   💰 CCA: ₹{office.cca}
                  // </p>
                )}
              </div>

              {/* Location Data */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-transparent p-2 rounded-md border border-border/80">
                <div>
                  <div className="text-foreground/70 mb-1 font-medium">{t('offices.card.lat')}</div>
                  <div className="font-mono font-semibold text-foreground">
                    {office.location.latitude.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-foreground/70 mb-1 font-medium">{t('offices.card.lng')}</div>
                  <div className="font-mono font-semibold text-foreground">
                    {office.location.longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground/70 border border-border/80 px-2 py-1 rounded-md">
                  {t('offices.card.radius')}: {office.radius}m
                </span>
                <div className="flex gap-2 opacity-100 [@media(hover:hover)]:lg:opacity-0 [@media(hover:hover)]:lg:group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={t('offices.buttons.edit')}
                    title={t('offices.buttons.edit')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(office);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={t('offices.buttons.delete')}
                    title={t('offices.buttons.delete')}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(office);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isFetching.offices && offices.length === 0 && (
        <EmptyOffices onAddOffice={() => setShowModal(true)} />
      )}

      {/* Office Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingOffice ? t('offices.editOffice') : t('offices.addNewOffice')}
        size="xl"
        scrollable={true}
      >
        {errors.general && (
          <Alert type="error" message={errors.general} className="mb-4" onClose={() => clearErrors()} />
        )}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" noValidate autoComplete="off">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <FormField
              name="name"
              label={t('offices.form.officeName')}
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value.replace(VALID_REGEX.OFFICE_NAME_CLEAN || /[^a-zA-Z0-9\s.\-&]/g, '').slice(0, 50);
                setFormData({ ...formData, name: val });
              }}
              required
              error={errors.name}
              autoComplete="off"
            />

            <FormField
              name="cityName"
              label={t('offices.form.cityName')}
              value={formData.cityName}
              onChange={(e) => {
                const filtered = e.target.value.replace(VALID_REGEX.CITY_NAME_CLEAN || /[^a-zA-Z\u00C0-\u017F\s.\-']/g, '').slice(0, 85);
                const titleCased = filtered.replace(VALID_REGEX.TITLE_CASE, char => char.toUpperCase());
                setFormData({ ...formData, cityName: titleCased });
              }}
              required
              error={errors.cityName}
              autoComplete="off"
            />

            <div className="lg:col-span-2">
              <Textarea
                name="address"
                id="office-address"
                label={t('offices.form.fullAddress')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                required
                error={errors.address}
                autoComplete="off"
              />
            </div>

            <FormField
              name="cca"
              label={t('offices.form.ccaAmount')}
              type="number"
              value={formData.cca}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setFormData({ ...formData, cca: '' });
                  return;
                }
                const numVal = parseFloat(val);
                if (isNaN(numVal)) return;
                if (numVal < 0) {
                  setFormData({ ...formData, cca: '0' });
                } else if (numVal > 100000) {
                  setFormData({ ...formData, cca: '100000' });
                } else {
                  setFormData({ ...formData, cca: val });
                }
              }}
              error={errors.cca}
              autoComplete="off"
            />

            <div className="space-y-2">
              <FormField
                name="latitude"
                label={t('offices.form.latitude')}
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => {
                  let val = e.target.value;
                  // Only allow numbers, one hyphen, and one dot
                  val = val.replace(VALID_REGEX.COORD_CLEAN, '');
                  if ((val.match(/-/g) || []).length > 1) val = val.slice(0, -1);
                  if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);

                  const num = parseFloat(val);
                  if (!isNaN(num)) {
                    if (num < -90) val = '-90';
                    if (num > 90) val = '90';
                    if (val.includes('.') && val.split('.')[1].length > 6) {
                      val = num.toFixed(6);
                    }
                  }
                  setFormData({ ...formData, latitude: val });
                }}
                required
                error={errors.latitude}
                autoComplete="off"
              />
              <Button
                type="button"
                onClick={getCurrentLocation}
                loading={locationLoading}
                size="sm"
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {t('offices.buttons.getCurrentLocation')}
              </Button>
            </div>

            <FormField
              name="longitude"
              label={t('offices.form.longitude')}
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => {
                let val = e.target.value;
                val = val.replace(VALID_REGEX.COORD_CLEAN, '');
                if ((val.match(/-/g) || []).length > 1) val = val.slice(0, -1);
                if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);

                const num = parseFloat(val);
                if (!isNaN(num)) {
                  if (num < -180) val = '-180';
                  if (num > 180) val = '180';
                  if (val.includes('.') && val.split('.')[1].length > 6) {
                    val = num.toFixed(6);
                  }
                }
                setFormData({ ...formData, longitude: val });
              }}
              required
              error={errors.longitude}
              autoComplete="off"
            />

            <FormField
              name="radius"
              label={t('offices.form.geoFencingRadius')}
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              required
              error={errors.radius}
              autoComplete="off"
            />

            <div className="lg:col-span-2">
              <label htmlFor="office-photo-upload" className="block text-sm font-medium text-foreground mb-1.5 cursor-pointer">
                {t('offices.form.officePhoto')}
              </label>

              {/* Row with file input + filename */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="office-photo-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-10"
                  />
                </div>

                {formData.photo && (
                  <span className="text-sm text-muted-foreground flex items-center h-10">
                    {formData.photo.name}
                  </span>
                )}
              </div>

              {/* Error below the row */}
              {errors.photo && (
                <p className="text-xs text-destructive mt-1">{errors.photo}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              {t('offices.cancel')}
            </Button>
            <Button type="submit" loading={submitting}>
              {editingOffice ? t('offices.updateOffice') : t('offices.createOffice')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
